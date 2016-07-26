<?php

namespace Proservia\CoreBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * Class ProductType
 * @package Proservia\CoreBundle\Form
 */
class ProductType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', TextType::class, array(
                'label' => 'Nom',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir un nom de Service',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('description', TextareaType::class, array(
                'label' => 'Description',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir un commentaire',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => false,
            ))
            ->add('offer', TextType::class, array(
                'label' => 'Offre',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir une Offre',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('dispatch', TextType::class, array(
                'label' => 'Dispatch',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir un nom',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('category', ChoiceType::class, array(
                'choices' => $options["allow_extra_fields"]["listeProductCategory"],
                'preferred_choices' => 'Choisir un Service',
                'multiple' => false,
                'label' => 'Category',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'class' => 'form-control font_exo_2 input-md select2-single',
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
            'data_class' => 'Proservia\CoreBundle\Entity\Product'
        ));
    }
}
