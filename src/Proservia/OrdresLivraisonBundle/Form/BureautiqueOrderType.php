<?php

namespace Proservia\OrdresLivraisonBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class BureautiqueOrderType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('id', HiddenType::class, array(
                'label' => 'id',
            ))
            ->add('site', ChoiceType::class, array(
                'choices' => $options["allow_extra_fields"]["listeSite"],
                'preferred_choices' => 'Choisir un Site',
                'multiple' => false,
                'label' => 'Site à livrer',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'class' => 'form-control font_exo_2 input-md select2-single',
                ),
                'required' => true,
            ))
            ->add('fixe1', TextType::class, array(
                'label' => 'ACER VERITON X2632G / LENOVO M700SFF',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'ACER VERITON X2632G / LENOVO M700SFF',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('fixe2', TextType::class, array(
                'label' => 'HP Z230 SCIENTIFIQUE',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'HP Z230 SCIENTIFIQUE',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('fixeBoost1', TextType::class, array(
                'label' => 'HP Z230 TECHNIQUE',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'HP Z230 TECHNIQUE',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('portable1', TextType::class, array(
                'label' => 'HP ZBOOK 17',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'HP ZBOOK 17',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('portable2', TextType::class, array(
                'label' => 'LENOVO L440 / LENOVO L450',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'LENOVO L440 / LENOVO L450',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('portableBoost1', TextType::class, array(
                'label' => 'LENOVO L540',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'LENOVO L540',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('portableUL1', TextType::class, array(
                'label' => 'LENOVO X250',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'LENOVO X250',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('portableUL2', TextType::class, array(
                'label' => '1 Disque Dur USB',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => '1 Disque Dur USB',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('comments', TextareaType::class, array(
                'label' => 'Commentaires',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Commentaires',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
        ;
    }
    
    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Proservia\OrdresLivraisonBundle\Entity\BureautiqueOrder'
        ));
    }
}
