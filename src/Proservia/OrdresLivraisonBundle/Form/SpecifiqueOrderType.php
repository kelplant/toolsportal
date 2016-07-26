<?php

namespace Proservia\OrdresLivraisonBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class SpecifiqueOrderType extends AbstractType
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
            ->add('fixe2', TextType::class, array(
                'label' => 'ACER VERITON X2632G',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'ACER VERITON X2632G',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('fixeBoost1', TextType::class, array(
                'label' => 'LENOVO P700',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'LENOVO P700',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('fixeBoost2', TextType::class, array(
                'label' => 'LENOVO C30 ',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'LENOVO C30 ',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('portable1', TextType::class, array(
                'label' => 'HP ZBOOK 15 G2',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'HP ZBOOK 15 G2',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('portable2', TextType::class, array(
                'label' => 'LENOVO L440',
                'label_attr' => array(
                    'class' => 'col-sm-5 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'LENOVO L440',
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
            'data_class' => 'Proservia\OrdresLivraisonBundle\Entity\SpecifiqueOrder'
        ));
    }
}
